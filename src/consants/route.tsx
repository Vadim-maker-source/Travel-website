import { faHouse, faMapLocationDot, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const sidebarLinks = [
    {
      imgURL: <FontAwesomeIcon icon={faHouse} />,
      route: "/",
      label: "Главная",
    },
    {
      imgURL: <FontAwesomeIcon icon={faMapLocationDot} />,
      route: "/my-trips",
      label: "Мои поездки",
    },
    {
      imgURL: <FontAwesomeIcon icon={faPaperPlane} />,
      route: "/send",
      label: "Отправить заявку"
    },
  ];