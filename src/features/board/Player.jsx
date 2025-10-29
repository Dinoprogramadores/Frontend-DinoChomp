const Player = ({ x, y, color }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 30,
        height: 30,
        backgroundColor: color,
        borderRadius: '50%',
        transition: 'left 0.1s linear, top 0.1s linear',
      }}
    />
  );
};

export default Player;
