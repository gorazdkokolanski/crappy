import Text from "./ShadowText";


interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  sound?: string | false;
  buttonType?: "tab" | string;
  isSmall?: boolean | string;
  className?: string;
  color?: "red" | "green" | "blue" | "yellow" | "blue-light",
  font?: string,
  type?: "button" | "submit" | "reset" | undefined,
}

const Button: React.FC<Props> = ({ text, className = "", color = "green", sound = "main", type = "button", buttonType, onClick, isSmall = " border", font = "32", children, ...props }) => {
  const classList = "custom upper " + color + " " + className;

  const handleClick = (e: any) => {
    onClick?.(e)
    sound !== false && window.sounds?.[sound]()
  };

  switch (buttonType) {
    case "tab":
      return (
        <button className={"custom-tab general-tab " + (className)} {...props} onClick={handleClick}>
          {text && <Text className={font ? "font-" + font : ""} text={text} />}
        </button>
      )

    default:
      return (
        <button className={classList} {...props} type={type} onClick={handleClick}  >
          <div className="custom--over border-black-2">
            <div className={`custom--wrapper${isSmall || ""}`}>
              {children}
              {text && <Text text={text} className={`custom--text ${font ? "font-" + font : ""}`} />}
            </div>
          </div>

        </button>
      )
  }



}

export default Button;