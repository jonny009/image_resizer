image_resizer
=============

Nodejs and Expressjs image resizer based on query
Image resizing based on query parameter

maxside - sets the largest side to the value passed; good if you don't know dimensions; pulls from cache if file exists.
width - sets the width & maintains aspect ratio; pulls from cache if file exists.
height - sets the height & maintains aspect ratio; pulls from cache if file exists.
width & height - sets the dimensions and ignores aspect ratio; pulls from cache if file exists.
nocache - creates a new image every time.