"use client";
import { useEffect, useState } from "react";

interface ChangingButtonProps {
  duration: number;
  text: string;
  color?: string;
}

const colorClasses: { [key: string]: string } = {
  red: "bg-red-400",
  yellow: "bg-yellow-400",
  purple: "bg-purple-400",
  green: "bg-green-400",
  blue: "bg-blue-400",
  pink: "bg-pink-400",
  indigo: "bg-indigo-400",
};

export default function Loading() {
  return (
    <div className="App flex justify-center items-center bg-gray-200  h-screen">
      <ChangingButton duration={3500} text="L" color="red" />
      <ChangingButton duration={1500} text="O" color="yellow" />
      <ChangingButton duration={3000} text="A" color="purple" />
      <ChangingButton duration={2500} text="D" color="green" />
      <ChangingButton duration={2000} text="I" color="blue" />
      <ChangingButton duration={1500} text="N" color="pink" />
      <ChangingButton duration={1000} text="G" color="indigo" />
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