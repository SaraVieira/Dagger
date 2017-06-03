import electron from 'electron'; // eslint-disable-line
import Dagger from './Components/Main/index';
import React, { Component } from 'react';
import dragDrop from 'drag-drop';
import { render } from 'react-dom';
import marked from 'marked';
import 'style.css';

const ipc = electron.ipcRenderer;
const remote = electron.remote;
const mainProcess = remote.require('./main.dev');
const clipboard = remote.clipboard;
const shell = electron.shell;

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = { html: undefined, md: undefined, file: null };

    this.updateState = this.updateState.bind(this);
  }

  componentWillMount() {
    ipc.on('file-opened', (event, file, content) => {
      this.setState({
        file,
        md: content,
        html: marked(content)
      });
    });

    ipc.on('file-changed', (event, content) => {
      this.setState({
        md: content,
        html: marked(content)
      });
    });


    ipc.on('save-html', () => {
      mainProcess.saveFile(this.state.html);
    });

    ipc.on('save-md', () => {
      mainProcess.saveMarkdown(this.state.md);
    });

    dragDrop('body', files => {
      const file = files[0];
      const content = mainProcess.getFileContent(file.path);
      this.setState({ file: file, md: content });
    });

    ipc.on('show-in-file-system', () => {
      shell.showItemInFolder(this.state.file);
    });

    ipc.on('open-in-default-editor', () => {
      shell.openItem(this.state.file);
    });

    ipc.on('save-file', () => {
      mainProcess.saveFile(this.state.html);
    });

    ipc.on('copy-html', () => {
      clipboard.writeText(this.state.html);
    });
  }

  updateState(md, html) {
    this.setState({
      md,
      html
    })
  }

  render() {
    return (
      <Dagger
        md={this.state.md}
        html={this.state.html}
        file={this.state.file}
        onChange={this.updateState}
      />
    );
  }
}

render(<Main />, document.getElementById('root'));

document.body.addEventListener('click', (event) => {
  if (event.target.matches('a[href^="http"]')) {
    event.preventDefault();
    shell.openExternal(event.target.href);
  }
});
