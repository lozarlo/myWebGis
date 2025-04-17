export default function Controls(props) {
  return (
    <div className="absolute right-4 top-18 bg-white p-2 shadow rounded shadow hover:bg-blue-100 transition-shadow">
      <button onClick={props.onResetView} className="btn cursor-pointer">
        Reset View
      </button>
    </div>
  );
}
