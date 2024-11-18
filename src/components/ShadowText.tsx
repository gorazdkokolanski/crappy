import React from "react";


interface Props extends React.HTMLAttributes<HTMLElement> {
  tag?: keyof JSX.IntrinsicElements;
  text: string | number;
  className?: string;
  upper?: boolean
  shadow?: boolean
}

const Text: React.FC<Props> = ({ tag = 'p', text, upper = true, shadow = true, className = "", ...props }) => {
  const classList = (shadow ? "text-shadow " : "") + "stroke " + (upper ? "upper " : "") + className;
  return React.createElement(tag, { ...props, className: classList, "data-text": text }, text);
};

export default Text;