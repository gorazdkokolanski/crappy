
import { AnimatedCounter } from "react-animated-counter";
import React, { useEffect, useState } from "react";
import { Token } from "../../../types/types";


const clampFont = () => {
  const def = 1920;
  const max = 24;
  const min = 8;
  const wW = window.innerWidth;
  let newFS: any = (max / def * wW).toFixed();

  if (newFS > max) {
    newFS = max
  }
  if (newFS < min) {
    newFS = min
  }

  return Number(newFS)
}


export default function Balance({ children, myBalance, account }: { myBalance: Token, children: any, account: any }) {
  const [fontSize, setFontSize] = useState(clampFont())

  useEffect(() => {
    myBalance.crappy && window.sounds?.balance()
    return () => { }
  }, [myBalance.crappy])

  return <>

    <div className="footer--balance flex v-center">
      {account && <div className="title flex  w-full">
        <p className="font-20-md">BALANCE</p>

        <div className="flex v-center">
          <div className="icon-coin icon-28 text-shadow icon-coin-silver-crappy"></div>
          <div className="flex v-center" style={{ height: (fontSize * 0.7) + "px" }}>

            {myBalance.crappy.split(".").map((ball: any, id: number) =>
              <React.Fragment key={id}>
                {id == 1 && <>
                  <span className="ticker-view" style={{ fontSize: fontSize + "px", height: (fontSize) + "px", marginTop: "-1px" }}>.</span>
                  {ball[0] == 0 && <AnimatedCounter
                    value={0}
                    color="#0c0c0c"
                    fontSize={fontSize + "px"}
                    decimalPrecision={0}
                    incrementColor={"#0c0c0c"}
                    decrementColor={"#0c0c0c"}
                    includeCommas
                  // includeDecimals={true}
                  />}
                </>}
                <AnimatedCounter
                  value={ball}
                  color="#0c0c0c"
                  fontSize={fontSize + "px"}
                  decimalPrecision={0}
                  incrementColor={"#0c0c0c"}
                  decrementColor={"#0c0c0c"}
                  includeCommas
                // includeDecimals={true}
                />

              </React.Fragment>

            )}


          </div>
        </div>
      </div>}
      {children}

    </div >
  </>
}