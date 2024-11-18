import { ChangeEvent, useEffect, useState } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Tooltip from "../../../components/Tooltip";
import ButtonBuyCrappy from "../../../components/ButtonBuyCrappy";



const navs = [
  { coff: 1.5 },
  { coff: 3 },
  { coff: 10 },
  { coff: 100 },
]

const errors = {
  "insufficient": {
    title: "CASHOUT",
    subtitle: ["Insufficient Balance to set a Cashout Multiplier.", "Time to buy some $CRAPPY! "],
    button: true
  },
  "max": {
    title: "CASHOUT",
    subtitle: ["Cashout Multiplier can be minimum 1.01x and maximum 100x!", "So change your mind, greedy Crapster!"],
    button: false,
  }
}




type Props = {
  cashoutInput: [string | number, React.Dispatch<React.SetStateAction<string | number>>],
  error: "insufficient" | "max" | "";
  account: any;
}

export default function InputCashout({ cashoutInput, error, account }: Props) {
  const [inputValue, setInputValue] = cashoutInput;
  const errorText = error ? errors[error] : null


  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {

    const newValue = event.target.value.replace(/x/g, '');
    if (/^\d*\.?\d*$/.test(newValue)) {
      setInputValue(newValue);
    }
  };

  useEffect(() => {
    setInputValue("")
    return () => { }
  }, [account])


  return <>

    <div className="footer--input cashout flex">
      <Input onChange={handleChange} value={inputValue ? `x${inputValue}` : ""} name="cashout" placeholder="x0.0" isError={error} >
        <div className="info flex v-center">
          <div className={"icon flex cover icon-24 status ratio" + (inputValue ? error ? " error" : " active" : "")}></div>
          <p className="font-16">Cashout Multiplier</p>
        </div>
      </Input >

      <div className="navs flex">
        {navs.map(nav => <Button font="28" key={nav.coff} onClick={() => {
          setInputValue(nav.coff)
        }} text={"x" + nav.coff} {...(inputValue == nav.coff) ? { "data-active": true } : {}} color="blue-light" />)}
      </div>

      {
        errorText && <Tooltip className="tooltip-error" {...errorText}>
          {errorText.button && < ButtonBuyCrappy />}
        </Tooltip>
      }

    </div >
  </>
}
