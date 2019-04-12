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
var logofilename = path.join(__dirname, "../scripts/images/openchainlogo.png");
var font = path.join(__dirname, "../scripts/fonts/ipaexg00301/ipaexg.ttf");
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
            width: 100,
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
	doc.image(logofilename, (doc.page.width - 380) /2, 100, {width: 380});
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
	
	var lines = questionnaire.preambleText.split("\n");
	for (var i = 0; i < lines.length; i++) {
		doc.text(lines[i]);
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

/**
 * Produces a single SPDX output file
 * @param opt command line options
 * @returns
 */
function produceSingleFile(opt) {
	if ('source' in opt.options) {
		console.error("Can not specify both file and source.  Choose one or the other.");
		opt.showHelp();
		process.exit(1);
	}
	var outputDir;
	if ('output' in opt.options) {
		outputDir = path.normalize(opt.options.output);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir);
		}
	} else {
		outputDir = path.parse(opt.options.file).dir;
	}
	var jsonFile = path.normalize(opt.options.file);
	if (!fs.existsSync(jsonFile)) {
		console.error("Input JSON file "+jsonFile+" does not exist.");
		process.exit(1);
	}
	var pdfFileName = path.join(outputDir, path.parse(jsonFile).name + ".pdf");
	if (fs.existsSync(pdfFileName)) {
		if (!('clean' in opt.options)) {
			console.error("Output file "+pdfFileName+" exists.  Either specify --clean or delete the file.");
			process.exit(1);
		}
	}
	try {
		createPdf(jsonFile, pdfFileName);
		console.info("Successfully produced "+pdfFileName);
	} catch(err) {
		console.error(err);
		process.exit(1);
	}
} 

/**
 * Produces a PDF file for every questionnair-*.json file in a given input directory
 * @param opt command line options
 * @returns
 */
function produceMultipleFiles(opt) {
	if (!('source' in opt.options)) {
		console.error('Missing required source directory parameter');
		opt.showHelp();
		process.exit(1);	
	}
	if (!('output' in opt.options)) {
		console.error('Missing required output directory parameter');
		opt.showHelp();
		process.exit(1);	
	}
	var outputDir = path.normalize(opt.options.output);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir);
	}
	var pdfFiles = glob.sync(outputDir + path.sep + '*');
	if ('clean' in opt.options) {		
		// clean out the old PDF file directory
		pdfFiles.forEach(function(pdfFile) {
			fs.unlinkSync(pdfFile);
		});
	}
	var numErrors = 0;
	var numFiles = 0;
	var error = "";
	var srcDir = path.normalize(opt.options.source);
	var files = glob.sync(srcDir + 'questionnaire*.json');
	files.forEach(function(file) {
		var pdfFileName = path.join(outputDir, path.parse(file).name + ".pdf");
		if (fs.existsSync(pdfFileName)) {
			numErrors++;
			error = error + "PDF file " + pdfFileName + " already exists.  Use --clean to delete files prior to producing the PDF's";
		} else {
			try {
				createPdf(file, pdfFileName);
				numFiles++;
			} catch(err) {
				numErrors++;
				error = error + "Error creating PDF file "+pdfFileName+": "+err+"; ";
			}
		}
	});
	console.log('PDF file generation complete complete ' + numFiles + ' created, ' + numErrors + ' errors occurred');
	if (numErrors > 0) {
		console.error(error);
		process.exit(1);
	}
}

function main() {
	var opt = require('node-getopt').create([
		['', 'source=SoureDirectory', 'Source directory containing conformance questionnaire JSON files'],
		['', 'output=OutputDirectory', 'Destination output directory containing conformance questionnaire JSON files'],
		['', 'clean', "Deletes all files in the destination output directory prior to producing the PDF's"],
		['', 'file=SourceJSONFileName', 'Produces a PDF file for a single JSON file.'],
		['h', 'help', 'Displays this help']])
		.bindHelp()
		.parseSystem();
	if ('h' in opt.options) {
		opt.showHelp();
		return;
	}
	if ('file' in opt.options) {
		produceSingleFile(opt);
	} else {
		produceMultipleFiles(opt);
	}
}

main();