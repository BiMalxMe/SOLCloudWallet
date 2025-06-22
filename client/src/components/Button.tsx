
export const Button = ({ children }: { children: React.ReactNode }) => {
  return (
    <button
      type="button"
      className="text-black bg-gradient-to-r from-white via-gray-100 to-gray-200 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 font-medium rounded-lg text-xl px-5 py-2 text-center me-2 mb-2 shadow transition-colors"
    >
      <span className="text-2xl">{children}</span>
    </button>
  );
};
