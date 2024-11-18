import Button from "./Button";

export default function ButtonBuyCrappy() {

  return <>
    <a href="https://app.uniswap.org/explore/tokens/base/0xc8e51fefd7d595c217c7ab641513faa4ad522b26" target="_blank" rel="noopener noreferrer" className="flex-1 flex">
      <Button text="BUY $CRAPPY" color="yellow" className="buy flex-1"  >
        <div className="custom--icon text-shadow icon-coin-silver-crappy"></div>
      </Button >
    </a>
  </>
}
