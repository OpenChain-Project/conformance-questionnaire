# Conformance Questionnaire
Welcome to the OpenChain Project Conformance Questionnaire repository.

This repository contains the conformance questionnaire used in the [OpenChain self-certification website](https://certification.openchainproject.org/).

Information on the OpenChain project can be found on the [OpenChain Project Website](https://www.openchainproject.org).

The questionnaire is maintained by the [OpenChain Conformance Working Group](https://www.openchainproject.org/conformance).  The Conformance Working Group also maintains a [Wiki](https://wiki.linuxfoundation.org/openchain/start#openchain-conformance).

## License
The materials in this repository is licensed under the Commons Attribution License 4.0 (CC-BY-4.0).

## File Information
The repository contains one file per language translation in the format questionnaire_LANGTAG.json where LANGTAG specifies the language in the [RFC 5646 format](https://tools.ietf.org/html/rfc5646) (e.g. questionnaire_en.json).  There is also a file questionnaire.json which contains the default language representation of the questionnaire.

## Contributing
Contributions are welcome.  Issues and Pull requests will be reviewed by the OpenChain Conformance Working Group.  Any contributions to the questions must be licensed under the CC-BY-4 license.

If you do not have a github account and would like to recommend changes, email the [Openchain Conformance Team](mailto:Openchain-conformance@lists.linuxfoundation.org) with your suggested changes.

### Github Users
The preferred method of updating the questionnaire is to create a pull request with the modifications to the questionnaire.json file.  To create a pull request, you will need a github username.  You can create a github user [here](https://github.com/join).  Members of the conformance team can gain write access to the repository.  To request access, email your github username to the [Openchain Conformance Team](mailto:Openchain-conformance@lists.linuxfoundation.org).  If you are not familiar with github and would like a quick and easy way to make small changes, those conformance team members with write access can do the following:
* Edit the [questionnaire.json file](questionnaire.json)
* Make your changes
* Select "Create a new branch and start a pull request" at the bottom of the page
* Enter a title and description of the changes
* Commit the changes

See [creating a pull request](https://help.github.com/articles/creating-a-pull-request/) for additional information.

If you are an experienced git user or if you do not have write access to the repository, you can create a pull request by forking the repository and making the changes.  See [creating a pull request from a fork](https://help.github.com/articles/creating-a-pull-request-from-a-fork/) for help on this approach.

### Changing an existing question
To make a change to the text of an existing question, do the following:
* Find the question searching for the question number.  The question numbers are immediately after `"questionNumber":`
* Edit the text which follows `"questionText":`

### Adding a simple yes/no question
The easiest and safest way to add simple yes/no question is to copy/paste an existing question and modify it:
* Find a question which includes `"answerType": "YES_NO"`
* Copy everything between the `{` and `}` surrounding the question information
* Paste the question within the section where you want to add the question
* Update the question text
* Change the spec reference numbers to indicate which specification section(s) the question relates to.  If there are no spec references, just leave things as a blank between the double quotes (e.g. `""`)
* Update the correct answer - be sure to use the proper case `"Yes"` and `"No"`
* Update any additional optional fields as described under the Questionnaire JSON Format section

### Working with Sub-Questions
Some of the questions include sub-questions where a correct answer depends on answering a minimum number of the subquestions correctly (e.g. Does you organization implement all of the following:...).

Sub-questions are listed after `"questions": [`.  Each of the sub-questions follow the same format as normal questions enclosed by `{` ... `}`.

Prior to the list of subquestions, the minimum number of correct answers for the subquestions is specified by `"minNumberValidatedAnswers": N,` where N is the minimum of  subquestions which must be correctly answered.  If a survey responses has less than the minimum number correctly answered, the entire question containing the subquestion will be deemed incorrect.

After the subquestions, the question text that shows up before the subquestion is listed along with the other fields detailed in the Questionnaire JSON Format section.

### Modifying Sections
Section information preceeds the questions for that section.  The `name` and `title` can be edited.  To create a new section, it is recommended to make a copy/paste of an existing section and edit the information updating the title, name, and questions as appropriate.  The copy/paste should include everything from the `{` before `"name":` to the `},` following the questions.

## Questionnaire JSON Format
At the top level, the JSON file contains 3 fields:
* `"specVersion"`: The version of specification questionnaire in the format X.Y.Z where X.Y is the specification version and Z is the patch level of the questionnaire.  Note that all language files should have exactly the same version.
* `"language"`: [RFC 5646 format](https://tools.ietf.org/html/rfc5646) language tag
* `"sections"`: The list of sections in the questionnaire

Each section has the following fields:
* `"name"`: The name of the section.  Typically in the form GN where N is the number of the section (although this format is not required by the website)
* `"title"`: The title of the section to be displayed in the UI
* `"questions"`: The list of questions belonging to the section

Each question has the following fields:
* `"number"`: Number must have a digit, lowercase letter and roman numeral format and adhere to the regular expression `(\d+)(\.[a-z]+)?(\.[ivxlmcd]+)?` (e.g. 1.a.i)
* `"question"`: Text for the question.  Must be UTF-8 encoded.
* `"type"`: One of:
  * `YES_NO`: A question where the only valid answers are Yes and No
  * `SUBQUESTIONS`: A category of questions where the correct answer depends on the number of correct sub question responses.
  * `YES_NO_NA`: A YES_NO question that can also have a response of Not Applicable
* `"correctAnswer"`: The answer which would be considered correct.  Valid entries in this column depend on the question type as described below:
  * `YES_NO`: Valid Correct Answer is either 'Yes' or 'No'
  * `YES_NO_NA`: Valid Correct Answer is either 'YesNotApplicable' or 'NoNotApplicable'
  * `SUBQUESTIONS`: This field is not used by SUBQUESTIONS.  The "minNumberValidatedAnswers" is used for determining the correct answer
* `"minNumberValidatedAnswers"`: The minimum number of subquestions which must be correctly answered.  Only valid for question types SUBQUESTIONS
* `"specReference"`: A list of specification sections and subsections related to the questions.  Can contain multiple reference numbers separated by commas.  Can be blank.
* `"notApplicablePrompt"`: Optional prompt to display for not applicable
* `"evidencePrompt"`: Reserved for future use as a prompt to the user when additional information is requested for a question
* `"evidenceValidation"`: Reserved for future use as a regular expression validation to be applied against the response to the evidence request

## Branches, Tags and Versions
The master branch will always be the version of the questionnaire under development.  

All questionnaires are versioned in the format X.Y.Z where X.Y matches the specification version number and Z in incremented on each revision of the questionnaire deployed to the self-certification website.

All deployed versions are tagged with the version number.

All released versions since version 1.2 are maintained in a branch identified by the release.

## Localization
See the [localization README](README-LOCALIZATION.md) for information on localizing the questionnaire.

## Self Certification Website Source
The source code for the self-certification website is available under the Apache 2.0 license in the [Online-Self-Certification-Web-App](https://github.com/OpenChain-Project/Online-Self-Certification-Web-App) repository.  Contributions to the web application are welcome.
