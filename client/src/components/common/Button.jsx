const Button = ({ children, onClick, loading = false, className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-4 py-2 rounded-md font-semibold text-white ${
        loading ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
      } ${className}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;
