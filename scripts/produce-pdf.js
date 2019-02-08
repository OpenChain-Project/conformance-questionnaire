/**
 * Create PDF documents for all of the questionnaire files and store them in an output directory
 * Deletes all previously existing PDF files in the output directory
 * It is assumed this script is run from the directory containing the questionnaire files
 * License:
 * SPDX-ID: MIT
 */

var PdfTable = require('voilab-pdf-table');
var PDFDocument = require('pdfkit');
var glob = require('glob');
var fs = require('fs');
var path = require('path');

var outputDir = "./docs/";
var srcDir = "./";
var imagedir = "./scripts/images/";
var fontDir = "./scripts/fonts/CharisSIL-5.000/";

var logofilename = "openchainlogo.png";
var fontFile = "CharisSIL-R.ttf";
var font = fontDir + fontFile;
var titleFontSize = 36;
var sectionFontSize = 16;
var headerFontSize = 12;
var questionFontSize = 9;

/**
 * Formats a spec reference to a comma separated list
 */
function formatSpecRef(specReference) {
	if (!specReference || specReference.length === 0) {
		return "";
	}
	var retval = specReference[0];
	for (var i = 1; i < specReference.length; i++) {
		retval += ", ";
		retval += specReference[i];
	}
	return retval;
}

/**
 * Formats a question into a string
 * @param question Question to be formatted
 * @returns string suitable for inclusion in the document
 */
function formatQuestion(question) {
	var questionText = question.number;
	if (question.specReference && question.specReference.length > 0) {
		questionText += " [";
		questionText += formatSpecRef(question.specReference);
		questionText += "]";
	}
	questionText += ": ";
	questionText += question.question;
	return questionText;
}

/**
 * Print a section
 * @param doc PDF document to print to
 * @param section to print
 * @returns nothing
 */
function printSection(doc, section, questionnaire) {
	doc.fontSize(sectionFontSize);
	doc.text(section.title);
	doc.fontSize(questionFontSize);
	if (!section.questions) {
		throw "Missing questions for section " + section.title;
	}
	var table = new PdfTable(doc, {
        bottomMargin: 30
    });
	table
    .addPlugin(new (require('voilab-pdf-table/plugins/fitcolumn'))({
        column: 'text'
    }))
    .setColumnsDefaults({
        headerBorder: 'LTBR',
        headerPadding: [5],
        headerAlign: 'center',
        border: 'LTBR',
        align: 'left',
        valign: 'center',
        padding: [5]
    })
    .addColumns([
        {
            id: 'section',
            header: ' ' + questionnaire.sectionColumnText,
            align: 'left',
            width: 80,
            valign: 'center',
            padding: [5]
        },
        {
            id: 'number',
            header: ' ' + questionnaire.numberColumnText,
            width: 60,
            valign: 'center',
            padding: [5]
        },
        {
            id: 'specref',
            header: ' ' + questionnaire.specRefColumnText,
            width: 60,
            valign: 'center',
            padding: [5]
        },
        {
            id: 'text',
            header: ' ' + questionnaire.questionColumnText,
            valign: 'center',
            padding: [5],
        }
    ])
    .onPageAdded(function (tb) {
    	tb.addHeader();
    });
	var rows = [];
	for (var i = 0; i < section.questions.length; i++) {
		rows.push({'section':section.title, 
			'number':section.questions[i].number,
			'specref':formatSpecRef(section.questions[i].specReference),
			'text':section.questions[i].question});
		if (section.questions[i].subQuestions) {
			var subquestions = section.questions[i].subQuestions;
			for (var subq in subquestions) {
				if (subquestions[subq]) {
					rows.push({'section':section.title, 
						'number':subquestions[subq].number,
						'specref':formatSpecRef(subquestions[subq].specReference),
						'text':'- '+subquestions[subq].question});
				}
			}
		}
	}
	table.addBody(rows);
}

function printPreamble(doc, questionnaire) {
	// Title page
	doc.image(imagedir+logofilename, (doc.page.width - 380) /2, 100, {width: 380});
	doc.fontSize(titleFontSize);
	doc.moveDown();
	doc.moveDown();
	doc.moveDown();
	doc.moveDown();
	doc.moveDown();
	doc.moveDown();
	doc.moveDown();
	doc.moveDown();
	doc.text(questionnaire.title, {align:'center'});
	doc.addPage();
	// Context
	doc.fontSize(sectionFontSize);
	doc.text(questionnaire.contextText, {align:'center'});
	doc.moveDown();
	doc.fontSize(questionFontSize);
	
	for (var line in questionnaire.preambleText) {
		doc.text(questionnaire.preambleText[line]);
		doc.moveDown();
	}
}

/**
 * Creates a PDF file
 * @param inputJsonFileName Name of an input JSON file name in the questionnaire format
 * @param outputPdfFileName File name for the output PDF file
 * @returns nothing
 */
function createPdf(inputJsonFileName, outputPdfFileName) {
	// Create a document 
	var doc = new PDFDocument();
	try {
		doc.pipe(fs.createWriteStream(outputPdfFileName));
	} catch (err) {
		throw "Unable to create output PDF file: "+err;
	}
	var questionnaire;
	try {
		questionnaire = JSON.parse(fs.readFileSync(inputJsonFileName, 'utf8'));
	} catch (err) {
		throw "Unable to read questionnaire: "+err;
	}
	
	if (!questionnaire.sections || questionnaire.sections.lenght === 0) {
		throw "No sections found";
	}
	
	doc.font(font);
	printPreamble(doc, questionnaire);
	for (var i = 0; i < questionnaire.sections.length; i++) {
		doc.addPage();
		printSection(doc, questionnaire.sections[i], questionnaire);
	}
	doc.end();
}

function main() {
	// clean out the old PDF file directory
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir);
	}
	var pdfFiles = glob.sync(outputDir + '*');
	pdfFiles.forEach(function(pdfFile) {
		fs.unlinkSync(pdfFile);
	});
	
	var numErrors = 0;
	var numFiles = 0;
	var error = "";
	
	var files = glob.sync(srcDir + 'questionnaire*.json');
	files.forEach(function(file) {
		var pdfFileName = outputDir + path.parse(file).name + ".pdf";
		try {
			createPdf(file, pdfFileName);
			numFiles++;
		} catch(err) {
			numErrors++;
			error = error + "Error creating PDF file "+pdfFileName+": "+err+"; ";
		}
	});
	console.log('PDF file generation complete complete ' + numFiles + ' created, ' + numErrors + ' errors occurred');
	if (numErrors > 0) {
		console.error(error);
		process.exit(1);
	}
}

main();