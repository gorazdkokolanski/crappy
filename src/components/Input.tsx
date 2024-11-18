

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean | string
}

const Input: React.FC<Props> = ({ className = "", type = "text", children, isError, ...props }) => {
  const classList = "label input " + className + (isError ? " error" : "");


  return <>
    <label className={classList}>
      <input className="font-16"  {...props} type={type} />
      {children}
    </label>

  </>
}

export default Input;