import marked from 'marked';
import React, { Component } from 'react';
import style from './style.css';
import ReactHtmlParser from 'react-html-parser';

type Props = {
  html: ?string,
  md: ?string,
  file: ?File | ?string,
  onChange: (c: string) => void
}


class Dagger extends Component {
  props: Props;
  constructor(props) {
    super(props);

    this.state = { html: this.props.html || 'Write here...', md: this.props.md || 'Write here...', file: this.props.file };

    this.renderMarkdownToHtml = this.renderMarkdownToHtml.bind(this);
    this.getContent = this.getContent.bind(this);
    this.renderToMarkdown = this.renderToMarkdown.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ html: nextProps.html, md: nextProps.md, file: nextProps.file });
    this.renderMarkdownToHtml(nextProps.md);
  }

  getContent(e) {
    const md = e.target.value;
    this.renderMarkdownToHtml(md);
    this.props.onChange(md, marked(md))
  }

  renderMarkdownToHtml(markdown) {
    return marked(markdown);
  }

  renderToMarkdown(markdown) {
    this.mdView.value = markdown;
  }

  render() {
    return (
      <section className={style.content}>
        <textarea
          className={style.rawMarkdown}
          onChange={this.getContent}
          value={this.state.md}
        />
        <div
          className={style.renderedHtml}
        >
          {ReactHtmlParser(this.state.html)}
        </div>
      </section>
    );
  }
}

export default Dagger;
