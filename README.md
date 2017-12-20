# Conformance Questionnaire
Welcome to the OpenChain Project Conformance Questionnaire repository.

This repository contains the conformance questionnaire used in the [OpenChain self-certification website](https://certification.openchainproject.org/).

Information on the OpenChain project can be found on the [OpenChain Project Website](https://www.openchainproject.org).

The questionnaire is maintained by the [OpenChain Conformance Working Group](https://www.openchainproject.org/conformance).  The Conformance Working Group also maintains a [Wiki](https://wiki.linuxfoundation.org/openchain/start#openchain-conformance).

## License
The materials in this repository is licensed under the Commons Attribution License 4.0 (CC-BY-4.0).

## File Information
There are two files in addition to this README file:

* SectionTitles.csv - A simple CSV file that maps section numbers in the questionnaire to section titles
* Questionnaire.csv - CSV file containing the questions used in the self-certification websites

## Questionnaire CSV Format
The following columns are used in the questionnaire:

* Question Number: Number must have a digit, lowercase letter and roman numeral format and adhere to the regular expression `(\d+)(\.[a-z]+)?(\.[ivxlmcd]+)?` (e.g. 1.a.i)
* Spec Reference Number: A list of specification sections and subsections related to the questions.  Can contain multiple reference numbers separated by commas.  Can be blank.
* Question Text: Text for the question.  Must be UTF-8 encoded.
* Answer Type: One of:
 * `YES_NO`: A question where the only valid answers are Yes and No
 * `SUBQUESTIONS`: A category of questions where the correct answer depends on the number of correct sub question responses.
 * `YES_NO_NA`: A YES_NO question that can also have a response of Not Applicable
* Correct Answer: The answer which would be considered correct.  Valid entries in this column depend on the question type as described below:
 * `YES_NO`: Valid Correct Answer is either 'Yes' or 'No'
 * `SUBQUESTIONS`: Valid Correct Answer is a numeric value indicating the minimum number of sub questions that need to be correctly answered for this question to be correctly answered
 * `YES_NO_NA`: Valid Correct Answer is either 'YesNotApplicable' or 'NoNotApplicable'
* Evidence Prompt: Reserved for future use as a prompt to the user when additional information is requested for a question
* Evidence Validation: Reserved for future use as a regular expression validation to be applied against the response to the evidence request
* Sub-Question Of Number: The SUBQUESTION question number this question is a sub questions of

## Branches, Tags and Versions
The master branch will always include the latest version of the questionnaire.  At times, the master branch may be ahead of the versions deployed on the OpenChain self-certification websites.

All questionnaires are versioned in the format X.Y.Z where X.Y matches the specification version number and Z in incremented on each revision of the questionnaire deployed to the self-certification website.

All deployed versions are tagged with the version number.

## Contributing
Contributions are welcome.  Issues and Pull requests will be reviewed by the OpenChain Conformance Working Group.  Any contributions to the questions must be licensed under the CC-BY-4 license.

## Self Certification Website Source
The source code for the self-certification website is available under the Apache 2.0 license in the [Online-Self-Certification-Web-App](https://github.com/OpenChain-Project/Online-Self-Certification-Web-App) repository.  Contributions to the web application are welcome.
