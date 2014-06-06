image_resizer
=============

Nodejs and Expressjs app with image resizing based on query string

```
maxside=*val*
```
sets the largest side to the value passed; good if you don't know dimensions; pulls from cache if file exists.

```
width=*val*
```
sets the width & maintains aspect ratio; pulls from cache if file exists.

```
height=*val*
```
sets the height & maintains aspect ratio; pulls from cache if file exists.

```
width=*val*&height=*val*
```
sets the dimensions and ignores aspect ratio; pulls from cache if file exists.

```
nocache=*val*
```
creates a new image every time.
