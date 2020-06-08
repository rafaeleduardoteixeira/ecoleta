import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import logo from "../../assets/logo.svg";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import axios from "axios";
import "./styles.css";
import api from "../../services/api";
import DropZone from '../../components/DropZone'

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGESiglaResponde {
  sigla: string;
}

interface IBGECityResponde {
  nome: string;
}

const CreatePoint = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>();
  const [selectedCity, setSelectedCity] = useState<string>();
  const [selectedItens, setSelectedItens] = useState<number[]>([]);
  const [inicialPosition, setInicialPosition] = useState<[number, number]>([0, 0]);
  const [selectedMapPosition, setSelectedMapPosition] = useState<[number, number]>([0, 0]);
  const [disabledCity, setDisabledCity] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File>();

  const history = useHistory();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInicialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get("itens").then((response) => {
      setItens(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get<IBGESiglaResponde[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados").then((response) => {
      const siglaState = response.data.map((uf) => uf.sigla);
      setStates(siglaState);
    });
  }, []);

  useEffect(() => {
    axios.get<IBGECityResponde[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`).then((response) => {
      const cities = response.data.map((city) => city.nome);
      setCities(cities);
    });
  }, [selectedState]);

  function handleStateSelected(event: ChangeEvent<HTMLSelectElement>) {
    const state = event.target.value;
    setSelectedState(state);

    if (state !== "0") {
      setDisabledCity(false);
    } else {
      setDisabledCity(true);
    }
  }

  function handleCitySelected(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedMapPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItens.findIndex((item) => item === id);
    if (alreadySelected >= 0) {
      const filteredItens = selectedItens.filter((item) => item !== id);
      setSelectedItens(filteredItens);
    } else {
      setSelectedItens([...selectedItens, id]);
    }
  }

  async function handleSubmit(event: FormEvent){
    event.preventDefault();

    const {name, email, whatsapp} = formData;
    const state = selectedState;
    const city = selectedCity;
    const [latitude, longitude] = selectedMapPosition;
    const itens = selectedItens;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('state', String(state));
    data.append('city', String(city));
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('itens', itens.join(','));

    if (selectedImage){
      data.append('image', selectedImage);
    }

    try{
        await api.post("points", data);
        //fazer tela de sucesso
        //history.push('/');
    }catch(e){
        console.log("Erro ao salvar ponto.")
    }
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>

        <DropZone onFileUploaded={setSelectedImage}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" onChange={handleInputChange} />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" name="email" id="email" onChange={handleInputChange} />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione um endereço no mapa</span>
          </legend>

          <Map center={inicialPosition} zoom={14} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedMapPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="state">Estado</label>
              <select name="state" id="state" value={selectedState} onChange={handleStateSelected}>
                <option value="0">Selecione uma UF</option>
                {states.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="state">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={handleCitySelected} disabled={disabledCity}>
                <option value="0">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Ítens de Coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>
          <ul className="itens-grid">
            {itens.map((item) => (
              <li key={item.id} onClick={() => handleSelectItem(item.id)} className={selectedItens.includes(item.id) ? "selected" : ""}>
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
