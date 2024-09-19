"use client";
import { useEffect, useState } from "react";

interface ChangingButtonProps {
  duration: number;
  text: string;
  color?: string;
}

const colorClasses: { [key: string]: string } = {
  red: "bg-[#ff7614]",
  yellow: "bg-[#e7721e]",
  purple: "bg-[#FF8833]",
  green: "bg-[#ffb681]",
  blue: "bg-[#e7721e]",
  pink: "bg-[#ff9b54]",
  indigo: "bg-[#FF8833]",
};

export default function Loading() {
  return (
    <div className="App flex justify-center items-center bg-[#181818] h-screen">
      <ChangingButton duration={1100} text="L" color="red" />
      <ChangingButton duration={1300} text="O" color="yellow" />
      <ChangingButton duration={2400} text="A" color="purple" />
      <ChangingButton duration={1700} text="D" color="green" />
      <ChangingButton duration={1500} text="I" color="blue" />
      <ChangingButton duration={900} text="N" color="pink" />
      <ChangingButton duration={600} text="G" color="indigo" />
    </div>
  );
}

function ChangingButton({
  duration,
  text,
  color = "red",
}: ChangingButtonProps) {
  const [toggle, setToggle] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setToggle(!toggle);
    }, duration);

    return () => clearTimeout(timer);
  }, [toggle, duration]);

  const handleClick = () => {
    setShowEmoji(true);
    setTimeout(() => {
      setShowEmoji(false);
    }, 1500);
    setToggle(!toggle);
  };

  const bgColorClass = colorClasses[color] || colorClasses.red;

  return (
    <div
      onClick={handleClick}
      className={`p-2 m-2 w-20 text-center font-bold duration-300 shadow rounded relative ${
        toggle
          ? `${bgColorClass} text-white top-10`
          : "bg-white text-black top-0"
      }`}
    >
      {showEmoji ? "😊" : text}
    </div>
  );
}