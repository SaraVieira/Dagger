/* global document */

const electron = require('electron');
const marked = require('marked');
const dragDrop = require('drag-drop');

const ipc = electron.ipcRenderer;
const $ = selector => document.querySelector(selector);
const $markdownView = $('.raw-markdown');
const $htmlView = $('.rendered-html');
const remote = electron.remote;
const mainProcess = remote.require('./main');
const clipboard = remote.clipboard;
const shell = electron.shell;
let currentFile = null;

function renderMarkdownToHtml(markdown) {
  const html = marked(markdown);
  $htmlView.innerHTML = html;
}

ipc.on('file-opened', (event, file, content) => {
  currentFile = file;
  $markdownView.value = content;
  renderMarkdownToHtml(content);
});

ipc.on('file-changed', (event, content) => {
  $markdownView.value = content;
  renderMarkdownToHtml(content);
});


ipc.on('save-file', () => {
  const html = $htmlView.innerHTML;
  mainProcess.saveFile(html);
});

ipc.on('copy-html', () => {
  const html = $htmlView.innerHTML;
  clipboard.writeText(html);
});

ipc.on('show-in-file-system', () => {
  shell.showItemInFolder(currentFile);
});

ipc.on('open-in-default-editor', () => {
  shell.openItem(currentFile);
});

document.body.addEventListener('click', (event) => {
  if (event.target.matches('a[href^="http"]')) {
    event.preventDefault();
    shell.openExternal(event.target.href);
  }
});

$markdownView.addEventListener('keyup', (event) => {
  const content = event.target.value;
  renderMarkdownToHtml(content);
});

ipc.on('save-html', () => {
  mainProcess.saveFile($htmlView.innerHTML);
});

ipc.on('save-md', () => {
  mainProcess.saveMarkdown($markdownView.value);
});

dragDrop('body', (files) => {
  const file = files[0];
  currentFile = file;
  const content = mainProcess.getFileContent(file.path);
  $markdownView.value = content;
  renderMarkdownToHtml(content);
});
