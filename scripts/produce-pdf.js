/**
 * http://usejsdoc.org/
 */

var PDFDocument = require('pdfkit');
var fs = require('fs');
 
// Create a document 
var doc = new PDFDocument();
 
// Pipe its output somewhere, like to a file or HTTP response 
// See below for browser usage 
doc.pipe(fs.createWriteStream('output.pdf'));
 
// Embed a font, set the font size, and render some text 
doc.text('Some text with an embedded font!', 100, 100);
doc.end();