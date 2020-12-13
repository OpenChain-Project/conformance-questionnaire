/**
 * Validate all OpenChain questionnaire files in the repository
 * It is assumed this script is run from the directory containing the questionnaire files
 * License:
 * SPDX-ID: MIT
 * Credit: Portions borrowed from https://github.com/spdx/license-list-XML/blob/master/validate-schema.js
 */

var glob = require('glob');
var fs = require('fs');

var srcDir = "./";

// Patterns used for validation
var specVersionPattern = new RegExp("^\\d+\\.\\d+(\\.\\d+)?$");
var langPattern = new RegExp("^[a-zA-Z-]+$");
var numberPattern = new RegExp("(\\d+)(\\.[a-z]+)?(\\.[ivxlmcd]+)?");
var specRefPattern = numberPattern;

/**
 * @param question Question to validate
 * @returns String containing error if any error occurs, otherwise returns null
 */
function validateQuestion(question) {
	var error = "";
	var qNum = "UNKNOWN";
	if (!question.number) {
		error += "Missing question number for UNKNOWN; ";
	} else {
		if (!numberPattern.test(question.number)) {
			error += "Invalid number format for question " + question.number + "; ";
		}
		qNum = question.number;
	}
	if (!question.question || question.question === "") {
		error += "Missing question for question number " + qNum + "; ";
	}
	if (question.specReference) {
		for (var i = 0; i < question.specReference.length; i++) {
			if (!specRefPattern.test(question.specReference[i])) {
				error += "Invalid specification reference '" + question.specReference[i] + "' for question number " + qNum + "; ";
			}
		}
	}
	if (!question.type) {
		error += "Missing type for question number " + qNum + "; ";
	} else {
		if (question.type === "YES_NO") {
			if (!question.correctAnswer) {
				error += "Missing correct answer for question number " + qNum + "; ";
			} else if (question.correctAnswer !== "Yes" && question.correctAnswer !== "No" && question.correctAnswer !== "Any") {
				error += "Incorrect answer '" + question.correctAnswer + "' for question number " + qNum + "; ";
			}
		} else if (question.type === "YES_NO_NA") {
			if (!question.correctAnswer) {
				error += "Missing correct answer for question number " + qNum + "; ";
			} else if (question.correctAnswer !== "Yes" && question.correctAnswer !== "No" && question.correctAnswer !== "YesNotApplicable" &&
					question.correctAnswer !== "NoNotApplicable" && question.correctAnswer !== "Any") {
				error += "Incorrect answer '" + question.correctAnswer + "' for question number " + qNum + "; ";
			}
		} else if (question.type === "SUBQUESTIONS") {
			if (!question.minNumberValidatedAnswers) {
				error += "Missing minimum number of correct answers for question number " + qNum + "; ";
			}
			if (!question.subQuestions) {
				error += "Missing subquestions for question number " + qNum + "; ";
			}
		} else {
			error += "Invalid type '" + question.type + "' for question number " + qNum + "; ";
		}
	}
	if (error) {
		return error;
	}
}

/**
 * @param section section to validate
 * @returns String containing error if any error occurs, otherwise returns null
 */
function validateSection(section) {
	var error = "";
	var sName = "UNKNOWN";
	if (!section.name) {
		error += "Missing name for section UNKNOWN; ";
	} else {
		sName = section.name;
	}
	if (!section.title) {
		error += "Missing title for section "+section.name + "; ";
	}
	if (section.questions === null) {
		error += "Missing questions for section "+section.name + "; ";
	} else {
		for (var i = 0; i < section.questions.length; i++) {
			var qError = validateQuestion(section.questions[i]);
			if (qError) {
				error += qError;
			}
		}
	}
	if (error) {
		return error;
	}
}
/**
 * @param file File to validate
 * @returns Error if any error occurs, otherwise returns null
 */
function validate(file) {
	var error = "";
	var questionnaire = JSON.parse(fs.readFileSync(file, 'utf8'));
	if (!questionnaire.specVersion) {
		error += "Missing specVersion ";
	} else {
		if (!specVersionPattern.test(questionnaire.specVersion)) {
			error += "Invalid specVersion "+questionnaire.specVersion+" ";
		}
	}
	if (!questionnaire.language) {
		error += "Missing language ";
	} else {
		if (!langPattern.test(questionnaire.language)) {
			error += "Invalid language "+questionnaire.language+" ";
		}
	}
	if (!questionnaire.sections) {
		error += "Missing sections ";
	} else {
		for (var i = 0; i < questionnaire.sections.length; i++) {
			var sectionErr = validateSection(questionnaire.sections[i]);
			if (sectionErr) {
				error += sectionErr;
			}
		}
	}
	if (error !== "") {
		error += " in file "+file;
		return new Error(error);
	}
}

function main() {
	var files = glob.sync(srcDir + 'questionnaire*.json');
	var numFailures = 0;
	var numPass = 0;
	var error = null;
	files.forEach(function(file) {
		var fileError = validate(file);
		if (fileError) {
			numFailures++;
			if (!error) {
				error = fileError;
			} else {
				// append the file in error
				error = new Error(error.message+fileError.message);
			}
		} else {
			numPass++;
		}
	});
	console.log('validation complete ' + numPass + ' passed, ' + numFailures + ' failed');
	if (error) {
		console.error(error.message);
		process.exit(1);
	}
}

main();
