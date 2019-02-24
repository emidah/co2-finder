import React, { Component } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class Dropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFull: false,
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(values) {
    const { onChange, maxValues } = this.props;
    // Make sure it's impossible to pick more than max
    if (values.length > (maxValues)) {
      this.setState({
        isFull: true,
      });
    } else {
      this.setState({
        isFull: false,
      });

      if (values.length === maxValues) {
        this.setState({
          isFull: true,
        });
      }
      if (typeof onChange === 'function') onChange(values);
    }
  }

  render() {
    let { options } = this.props;
    const { defaultValue, isDisabled, selected } = this.props;
    const { isFull } = this.state;
    if (isFull) options = [];
    return (
      <Select
        value={selected}
        onChange={this.onChange}
        defaultValue={defaultValue}
        isMulti
        name="countries"
        options={options}
        className="basic-multi-select"
        classNamePrefix="select"
        isDisabled={isDisabled}
      />
    );
  }
}

Dropdown.propTypes = {
  defaultValue: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequried,
    label: PropTypes.string.isRequried,
  })),
  maxValues: PropTypes.number,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequried,
    label: PropTypes.string.isRequried,
  })),
  isDisabled: PropTypes.bool,
  selected: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequried,
    label: PropTypes.string.isRequried,
  })),
};

Dropdown.defaultProps = {
  defaultValue: [],
  maxValues: 5,
  onChange: () => {},
  options: [],
  isDisabled: false,
  selected: [],
};

export default Dropdown;
