// styles
import "./Input.scss";
// external
import React from "react";
import PropTypes from "prop-types";
import {Icon} from '@blueprintjs/core';
import {get} from 'lodash';
// internal
import { classNames } from "utils";

class Input extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      indicatorWidth:
        this.props.indicatorWidth || (this.props.indicator ? 34 : 0),
      displayPassword: false,
      value: this.props.value,
    };
  }

  componentDidMount() {
    !this.props.mouseWheel &&
      this.refs.input.addEventListener(
        "mousewheel",
        e => {
          e.preventDefault();
        },
        false
      );
    
    if(this.props.type === "number"){
      if(Number(this.state.value) === 0){
        // First render clear value if value is 0.
        this.setState({ value: "" });
      }
    }
  }

  __toggleDisplayPassword() {
    this.setState({ displayPassword: !this.state.displayPassword });
  }

  focus() {
    this.refs["input"].focus();
  }

  __handleContextMenu = e => {
    if (this.props.placeholder && this.props.placeholder.props) {
      e.preventDefault();
      //TODO open translator modal
    }
  };

  static getDerivedStateFromProps(props, state) {
    if (props.type === "number") {
      if (Number(state.value) === props.value) {
        return null; // If props number not been changed.
      } else {
        return {
          value: props.value, // Else set new value.
        };
      }
    } else {
      return {
        value: props.value,
      };
    }
  }

  render() {
    let { placeholder } = this.props;
    placeholder =
      typeof placeholder === "string"
        ? placeholder
        : get(placeholder, 'props.langContent', undefined);

    let type = this.props.type;
    let error = false;

    if (this.props.type === "password" && this.state.displayPassword) {
      type = "text";
    }

    if (this.props.type === "datetime") {
      type = "datetime-local";
    }

    if (this.props.type === "code") {
      type = "tel";
    }

    if (this.props.type === "number") {
      if (this.props.value && isNaN(this.props.value)) {
        error = true;
      }
    }

    const className = classNames({
      Input: true,
      multiLine: this.props.multiLine,
      error: this.props.error || error,
      password: this.props.type === "password"
    });

    const wrapperClassName = classNames({
      Input__wrapper: true,
      [this.props.classNameWrapper]: !!this.props.classNameWrapper,
      [this.props.size]: !!this.props.size
    });

    const inputType = this.props.type === "number" && !this.props.requiredType
      ? "text"
      : type;

    let params = {
      className,
      type: inputType,
      name: this.props.name,
      placeholder: placeholder,
      autoComplete: this.props.autoComplete,
      autoFocus: this.props.autoFocus,
      onKeyPress: this.props.onKeyPress,
      readOnly: this.props.readOnly,
      onFocus: this.props.onFocus,
      required: this.props.required,
      id: this.props.id,
      style: {
        paddingRight: 16 + this.state.indicatorWidth
      }
    };

    if (this.props.positive) {
      params.min = 0;
    }

    const value = this.props.pattern
      ? ((this.state.value || "").match(this.props.pattern) || []).join("")
      : this.state.value;

    let cont;
    if (this.props.multiLine) {
      cont = (
        <textarea
          ref="input"
          {...params}
          onContextMenu={this.__handleContextMenu}
          onChange={this.__onChange}
        >
          {this.state.value}
        </textarea>
      );
    } else {
      cont = (
        <input
          ref="input"
          {...params}
          value={value === null || typeof value === 'undefined' ? "" : value}
          onKeyPress={this.__onKeyPress}
          onChange={this.__onChange}
          onBlur={this.props.onBlur || (() => {})}
          disabled={this.props.disabled}
          autoFocus={this.props.autoFocus}
          onContextMenu={this.__handleContextMenu}
        />
      );
    }

    const closeEyeSvg = "eye-off";
    const openEyeSvg = "eye-open";

    const reliability = this.props.reliability ? (
      <div className="Input__reliability">
        <div className="Input__reliability__label">Weak</div>
        <div className="Input__reliability__indicator">
          <div className="Input__reliability__indicator__fill"></div>
        </div>
      </div>
    ) : null;

    return (
      <div className={wrapperClassName} onClick={this.props.onClick}>
        {cont}
        {this.props.type === "password" && (
          <div
            className="Input__display_password_button"
            onClick={this.__toggleDisplayPassword.bind(this)}
          >
            <Icon
              icon={this.state.displayPassword ? closeEyeSvg : openEyeSvg}
            />
          </div>
        )}
        {reliability}
        {this.props.indicator && (
          <div
            className="Input__indicator"
            ref={ref =>
              !this.state.indicatorWidth &&
              this.setState({ indicatorWidth: ref || 0 })
            }
          >
            {this.props.indicator}
          </div>
        )}
        {this.props.description !== undefined ? (
          <div className="Input__description">
            {typeof this.props.description !== "string" ? (
              this.props.description
            ) : (
              <div>{this.props.description}</div>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  __onKeyPress = e => {
    if (this.props.onKeyPress) {
      return this.props.onKeyPress(e);
    }

    if (this.props.type === "code") {
      if (isNaN(e.key)) {
        e.preventDefault();
      }
    }

    if (this.props.pattern && !this.props.pattern.test(e.key)) {
      e.preventDefault();
    }

    if (this.props.type === "number") {
      if (this.props.cell) {
        if (isNaN(e.key)) {
          e.preventDefault();
        }
      }

      if (e.target.value === "0") {
        e.target.value = "";
      }

      if(e.key === "." || e.key === ",") {
        if (e.target.value.indexOf(".") !== -1) {
          e.preventDefault(); // If "." exists, we can't write more.
        }
      } else if (isNaN(e.key)) {
        e.preventDefault();
      }
    }

    if (this.props.maxLength && e.target.value.length >= this.props.maxLength) {
      e.preventDefault();
    }
  };

  __onChange = e => {
    if (this.props.type === "number") {
      if (this.props.positive && Number(e.target.value) < 0) {
        e.target.value = 0;
      }
      
      const value = e.target.value;
      const replacedValue = value.replace(",", ".").replace(" ", "");
      const result = replacedValue === "." ? "0." : replacedValue;
      e.target.value = result;

      if (isNaN(e.target.value)) {
        e.preventDefault();
      }

      this.props.onChange && this.props.onChange(e);
      this.setState({ value: e.target.value });
      this.props.onTextChange && this.props.onTextChange(Number(e.target.value));

      // if (this.props.cell && e.target.value) {
      //   e.target.value = parseInt(e.target.value);
      // }
    }else{
      this.props.onChange && this.props.onChange(e);
      this.setState({ value: e.target.value });
      this.props.onTextChange && this.props.onTextChange(e.target.value);
    }
  };
}

Input.defaultProps = {
  classNameWrapper: "",
  disabled: false,
  error: false,
  autoFocus: false,
  mouseWheel: true,
  positive: false,
  cell: false,
  maxLength: null,
  pattern: null
};

Input.propTypes = {
  mouseWheel: PropTypes.bool,
  placeholder: PropTypes.any,
  onChange: PropTypes.func,
  openModalTranslate: PropTypes.func,
  onTextChange: PropTypes.func,
  multiLine: PropTypes.bool,
  value: PropTypes.any,
  indicator: PropTypes.node,
  onClick: PropTypes.func,
  classNameWrapper: PropTypes.string,
  disabled: PropTypes.bool,
  maxLength: PropTypes.number,
  pattern: PropTypes.string,
  description: PropTypes.string,
  size: PropTypes.oneOf(["small"]),
  type: PropTypes.oneOf(["text", "number", "password", "code"]),
  positive: PropTypes.bool,
  cell: PropTypes.bool,
  id: PropTypes.string,
};

export default React.memo(Input);
