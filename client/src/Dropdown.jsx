import React, { Component } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(values) {
    const { onChange, maxValues } = this.props;
    if (values.length <= (maxValues)) {
      onChange(values);
    }
  }

  render() {
    let { options } = this.props;
    const {
      defaultValue, isDisabled, selected, maxValues,
    } = this.props;

    // Make sure it's impossible to pick more than max
    if (selected.length === maxValues) {
      options = [
        {
          label: 'Please remove a country before adding another',
          value: 'none',
        }];
    }

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
