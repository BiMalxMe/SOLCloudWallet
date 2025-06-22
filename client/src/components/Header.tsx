import { Svg } from "./Svg";

export const Header = () => {
  return (
    <header className="flex items-center py-4 px-6">
      {/* Replace the following span with your imported SVG icon */}
      <span className="mr-3">
        {/* <YourSvgIcon /> */}
        <Svg />
      </span>
      <span className="font-bold text-xl">Cloud Wallet</span>
    </header>
  );
}