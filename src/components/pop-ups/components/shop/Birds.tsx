import { useEffect, useRef, useState } from "react";
import Button from "../../../Button";
import ScrollBarWrapper from "../../../ScrollBarWrapper";
import Text from "../../../ShadowText";
import { State, Store } from "../../../../types/state";
import { Skin } from "../../../../types/types";
import { birds_types, setLastSkin } from "../../../../utils/utils";

interface Bird {
  name: string;
  id: number,
  description: string;
}

type Props = {
  data: Bird,
  loading: boolean,
  connect: () => void,
  onEquip: (n: string) => void,
  onSkinBought: (n: number) => void,
  store: State
}

const Bird = ({ data, connect, store, onEquip, onSkinBought, loading }: Props) => {
  const { contracts: { crappySkins }, web3: { account }, birdSkin, ownedSkins, crappySkinsID, myBalance } = store;
  const { id, name, description } = data;
  const type = birds_types[id];
  const isActive = birdSkin == type;
  const [isBought, setIsBought] = useState(ownedSkins.includes(id));
  const [isLoading, setIsLoading] = useState(false)
  const skin = crappySkinsID[id] || { active: true, price: 0 }

  useEffect(() => {
    setIsBought(ownedSkins.includes(id))
    return () => { }
  }, [ownedSkins])

  const handleEquip = () => onEquip(type)

  const onBuy = async () => {
    try {
      setIsLoading(true)
      const ress = await crappySkins?.write.buySkin(id);
      await ress.wait()
      onSkinBought(id)
      window.updateMyBalance?.()
    } catch (error) {
      //  console.log("buy error", error);
      setIsLoading(false)
    }
    setIsLoading(false)

  }

  return <>
    <div className="wrapper--grid-row flex overflow-h">
      <div className={"block border-black-4 border-8 w-full"}>
        <Text className="font-32 name text-center" text={name} />

        <div className="icon-bird flex flex-1 cover ratio">
          <img src={`./img/birds/crappy_${type}.svg`} />
        </div>

        <Text className="font-20 description text-center" text={description} upper={false} />

        <div className="status flex v-center h-center w-full">
          {
            isActive && isBought ?
              <Text className="font-32" text={"equipped"} /> :
              isBought ?
                <Button text="Equip" className="w-full" color="yellow" sound="equip" onClick={account ? handleEquip : connect} >
                  <div className="custom--icon flex ratio icon-play"></div>
                </Button > :
                <Button text={loading ? "" : skin.price.toString()}
                  disabled={!skin.active || myBalance.crapps < skin.price}
                  className={`w-full${isLoading ? " pointer-none" : ""}`}
                  sound="buy"
                  onClick={account ? onBuy : connect} >
                  <div className={`custom--icon text-shadow ${isLoading || loading ? "icon-28 icon-loading" : "icon-coin-gold-crapps"}`} />
                </Button >
          }
        </div>

      </div>

    </div>
  </>
}



export default function Birds({ state, loading }: { state: Store, loading: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const store = state.getState();

  const connect = () => state.setPopUp("connect");
  const onEquip = (name: string) => {
    setLastSkin(name, store.web3.account)
    state.setBirdSkin(name)
  };

  const onSkinBought = (id: number) => {
    state.setOwnedSkins([...store.ownedSkins, id])
  }

  const birdsArray: Bird[] = [
    { name: "Little Crappy", id: 3, description: "Your average air rat. Not too fancy, but still leaves a mark in the end." },
    { name: "Business Class Pigeon", id: 0, description: "Rare, shiny mess of the skies. Somehow still a load of crap." },
    { name: "First Class Pigeon", id: 1, description: "A refined pooper. Even birds know when it’s time to class things up." },
    { name: "Yankee Doodle Pigeon", id: 2, description: "The most majestic pigeon out there. You can’t catch him." },
  ]


  useEffect(() => {
    const wrapper = wrapperRef.current
    const parent = wrapper?.closest(".wrapper") || wrapper?.parentElement;
    let height: any = window.innerHeight;

    const resize = () => {
      height = wrapper?.clientHeight;
      parent?.setAttribute("style", `--shop-height: ${height}px`)
    }

    const rs = new ResizeObserver(resize)
    rs.observe(parent || document.body);
    resize()

    return () => {
      rs.disconnect()
    }
  }, [])

  return <>

    <div className="pop_up--overflow" ref={wrapperRef}>
      <ScrollBarWrapper>
        <div className="wrapper--grid">
          {birdsArray.map((b, id: number) => <Bird key={id} data={b} {...{ store, onEquip, connect, onSkinBought, loading }} />)}
        </div>
      </ScrollBarWrapper>
    </div>
  </>

}
