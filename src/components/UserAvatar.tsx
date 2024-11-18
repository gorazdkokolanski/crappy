
export default function UserAvatar({ lvl, temp, name = "" }: { lvl: any, temp?: any, name?: string }) {
  const avatar = lvl ? `cousins/lvl_${lvl}.svg` : (temp || "no_avatar.png");

  function isBlackAvatar() {
    return lvl % 5 === 0 ? " dark" : "";
  }

  return <>
    <div className={"user-avatar flex border-black-2 cover" + (lvl ? " has-cousen" : "") + name + isBlackAvatar()}>
      <img src={"./img/" + avatar} />
    </div>
  </>
}
