import React, { Fragment, useState } from "react";
import logo from "../../assets/logo.svg";
import { FiLogIn, FiSearch, FiX } from "react-icons/fi";
import "./styles.css";

const Home = () => {
  const [openModal, setOpenModal] = useState<Boolean>(false);
  function handleSearchButton(status: Boolean) {
    setOpenModal(status);
  }

  return (
    <Fragment>
      <div id="page-home">
        <div className="content">
          <header>
            <img src={logo} alt="Ecoleta" />
            <a href="./create-point">
              <span>
                <FiLogIn />
              </span>
              Cadastre um ponto de coleta
            </a>
          </header>
          <main>
            <h1>Seu marketplace de coleta de resíduos.</h1>
            <p>Ajudamos pessoas a entrarem pontos de coleta de forma eficiente.</p>
            <a onClick={() => handleSearchButton(true)} href="/#">
              <span>
                <FiSearch size={25} />
              </span>
              <strong>Buscar ponto de coleta</strong>
            </a>
          </main>
        </div>
      </div>

      <div id="modal" className={openModal ? "" : "hide"}>
        <div className="content">
          <div className="header">
            <h1>Pontos de coleta</h1>
            <button className="closeWhite" onClick={() => handleSearchButton(false)}>
              <FiX />
            </button>
          </div>
          <form action="./search">
            <label>Cidade</label>
            <div className="search field">
              <input className="input" type="text" placeholder="Pesquise por cidade" name="search" />
              <button className="searchWhite">
                <FiSearch />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default Home;
