import React from "react"
import NavProfile from "./navProfile"
import { Link } from "react-router-dom"
import { ContactForUs } from "./index"
import { useSelector } from "react-redux"
import { getIsLoggedIn } from "../../../../store/slices/userSlice"

const NavBar = () => {
  const currentUser = useSelector(getIsLoggedIn())

  return (
    <>
      <ul className='menu__box'>
        <div className='menu__logo'>
          <div className='logo'>
            <Link to='/'>Мир красоты</Link>
          </div>
        </div>
        <NavProfile />
        <li>
          <Link className={"menu__item"} to={"/"}>
            Главная
          </Link>
        </li>
        <li>
          <Link className={"menu__item"} to={"/booking"}>
            Записаться
          </Link>
        </li>
        <li>
          <Link className={"menu__item"} to={"/comments"}>
            Ваши отзывы
          </Link>
        </li>
        {!currentUser && (
          <li>
            <Link className={"menu__item"} to={"auth/login"}>
              Вход/Регистрация
            </Link>
          </li>
        )}

        <ContactForUs />
      </ul>
    </>
  )
}

export default NavBar
