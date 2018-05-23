/**
 * Create PDF documents for all of the questionnaire files and store them in an output directory
 * Deletes all previously existing PDF files in the output directory
 * It is assumed this script is run from the directory containing the questionnaire files
 * License:
 * SPDX-ID: MIT
 */

var PDFDocument = require('pdfkit');
var glob = require('glob');
var fs = require('fs');
var path = require('path');

var outputDir = "../pdfs/";
var srcDir = "./";

var font = "Times-Roman";
var sectionFontSize = 16;
var questionFontSize = 10;

/**
 * Print a section
 * @param doc PDF document to print to
 * @param section to print
 * @returns nothing
 */
function printSection(doc, section) {
	doc.fontSize(sectionFontSize);
	doc.text(section.title);
	doc.fontSize(questionFontSize);
	if (!section.questions) {
		throw "Missing questions for section " + section.title;
	}
	for (var i = 0; i < section.questions.length; i++) {
		doc.moveDown();
		var question = section.questions[i];
		var questionText = question.number;
		if (question.specReference && question.specReference.length > 0) {
			questionText += " [";
			questionText += question.specReference[0];
			for (var j = 1; j < question.specReference.length; j++) {
				questionText += ", ";
				questionText += question.specReference[j];
			}
			questionText += "]";
		}
		questionText += ": ";
		questionText += question.question;
		doc.text(questionText);
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
	printSection(doc, questionnaire.sections[0]);
	for (var i = 1; i < questionnaire.sections.length; i++) {
		doc.addPage();
		printSection(doc, questionnaire.sections[i]);
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