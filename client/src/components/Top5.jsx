import React from 'react';
import PropTypes from 'prop-types';

const Tops = (props) => {
  let counter = 0;
  return props.top5.map((item) => {
    counter += 1;
    return (
      <tr key={item.label}>
        <td>{counter}</td>
        <td>{item.label}</td>
        <td>{parseFloat(item.emissions).toLocaleString('en-US')}</td>
      </tr>
    );
  });
};

const Top5 = (props) => {
  const { title, top5, onButtonClicked } = props;
  return (
    <div>
      <h3>
        {title}
      </h3>
      <table>
        <tbody>
          <Tops top5={top5} />
        </tbody>
      </table>
      <button className="topButton" type="button" onClick={onButtonClicked}>Show</button>
    </div>
  );
};

Top5.propTypes = {
  top5: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequried,
    label: PropTypes.string.isRequried,
    emissions: PropTypes.string.isRequried,
    year: PropTypes.string.isRequried,
  })),
  title: PropTypes.string,
  onButtonClicked: PropTypes.func,
};

Top5.defaultProps = {
  top5: [],
  title: '',
  onButtonClicked: () => {},
};

export default Top5;
