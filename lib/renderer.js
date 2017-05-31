/* global document */

const electron = require('electron');
const marked = require('marked');
const dragDrop = require('drag-drop');

const ipc = electron.ipcRenderer;
const $ = selector => document.querySelector(selector);
const $markdownView = $('.raw-markdown');
const $htmlView = $('.rendered-html');
const $openFileButton = $('#open-file');
const $saveFileButton = $('#save-file');
const $saveMarkdown = $('#save-md');
const $copyHtmlButton = $('#copy-html');
const $showInFileSystemButton = $('#show-in-file-system');
const $openInDefaultEditorButton = $('#open-in-default-editor');
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

  $showInFileSystemButton.disabled = false;
  $openInDefaultEditorButton.disabled = false;

  $markdownView.value = content;
  renderMarkdownToHtml(content);
});

ipc.on('save-file', () => {
  const html = $htmlView.innerHTML;
  mainProcess.saveFile(html);
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

$openFileButton.addEventListener('click', () => {
  mainProcess.openFile();
});

$copyHtmlButton.addEventListener('click', () => {
  const html = $htmlView.innerHTML;
  clipboard.writeText(html);
});

$saveFileButton.addEventListener('click', () => {
  mainProcess.saveFile($htmlView.innerHTML);
});

$saveMarkdown.addEventListener('click', () => {
  mainProcess.saveMarkdown($markdownView.value);
});

$showInFileSystemButton.addEventListener('click', () => {
  shell.showItemInFolder(currentFile);
});

$openInDefaultEditorButton.addEventListener('click', () => {
  shell.openItem(currentFile);
});

dragDrop('body', (files) => {
  const file = files[0];
  currentFile = file;
  const content = mainProcess.getFileContent(file.path);

  $showInFileSystemButton.disabled = false;
  $openInDefaultEditorButton.disabled = false;

  $markdownView.value = content;
  renderMarkdownToHtml(content);
});
