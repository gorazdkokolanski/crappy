import { ChangeEvent, useEffect, useState } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Tooltip from "../../../components/Tooltip";
import ButtonBuyCrappy from "../../../components/ButtonBuyCrappy";



const navs = [
  { coff: 1 },
  { coff: 10 },
  { coff: 25 },
  { coff: 100, title: "MaX" },
]




type Props = {
  crappyInput: [string | number, React.Dispatch<React.SetStateAction<string | number>>],
  error: "insufficient" | "max" | "";
  myBal: number | any;
  account: any;
  maxBet: number | string;
}


export default function InputCrappy({ crappyInput, error, myBal, account, maxBet }: Props) {


  const errors = {
    "insufficient": {
      title: "place bet",
      subtitle: ["Insufficient Balance to place this bet.", "Time to buy some $CRAPPY!"],
      button: true
    },
    "max": {
      title: "place bet",
      subtitle: [`Maximum bet size can not exceed ${maxBet.toLocaleString('en-US')} $CRAPPY.", "Change your bet, you Crappy Whale!`],
      button: false,
    }
  }

  const [inputValue, setInputValue] = crappyInput;
  const errorText = error ? errors[error] : null;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    setInputValue("")
    return () => { }
  }, [account])

  return <>

    <div className="footer--input cashout flex">
      <Input onChange={handleChange} value={inputValue} placeholder="0" name="crappy" type="number" min={"0"} isError={account ? error : false} >
        <div className="info flex v-center ">
          <div className="icon-coin icon-28 text-shadow icon-coin-silver-crappy"></div>
          <p className="font-16">$CRAPPY</p>
        </div>
      </Input>

      <div className="navs flex">
        {navs.map((nav, id) => {
          let coff = account ? (nav.coff / 100 * myBal).toFixed(2) : "";

          if (coff > maxBet) coff = `${maxBet}`;

          return <Button font="28" key={id}
            {...(inputValue && (inputValue == coff) && account) ? { "data-active": true } : {}}
            onClick={() => { setInputValue(coff) }}
            text={nav.title || (nav.coff + "%")} color="blue-light" />
        })}
      </div>

      {errorText && account && <Tooltip className="tooltip-error" {...errorText}>
        {errorText.button && < ButtonBuyCrappy />}
      </Tooltip>}

    </div >
  </>
}
