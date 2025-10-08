import { dev_log } from "@/lib/utils";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

type execApiProps = {
  url: string;
  data: object;
  method?: string;
  dontNeedLogout?: boolean;
  apiUrl?: string | null;
};
export const execApi = async <T>({
  url,
  data,
  method,
  dontNeedLogout,
  apiUrl,
}: execApiProps): Promise<AxiosResponse<T>> => {
  let api = apiUrl ?? import.meta.env.VITE_URL_DOTCORE;
  const hasAuthToken = localStorage.getItem("token");
  let header: AxiosRequestConfig = {};
  if (hasAuthToken) {
    header = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${localStorage.getItem("token")}`,
      },
    };
  } else {
    header = {
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
  let execution;
  if (method === "POST") execution = axios.post(`${api}${url}`, data, header);
  else if (method === "PUT")
    execution = axios.put(`${api}${url}`, data, header);
  // else if(method === 'DELETE') execution = axios.delete(`${api}${url}`,data,header);
  else execution = axios.get(`${api}${url}`, header);
  try {
    const response = await execution;
    return response;
  } catch (error: any) {
    dev_log(() => console.log(error));
    if (error.response && error.response.status == 401 && !dontNeedLogout) {
      localStorage.clear();
      window.location.reload();
    }
    throw new Error(error);
  }
};

export const execPrc = async (
  url: string,
  prc: string,
  data: object,
  method: string,
  dontNeedLogout?: boolean
): Promise<AxiosResponse<[]>> => {
  let header: AxiosRequestConfig = {};
  const hasAuthToken = localStorage.getItem("token");
  if (hasAuthToken) {
    header = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${localStorage.getItem("token")}`,
        Codigo: prc,
      },
    };
  } else {
    header = {
      headers: {
        "Content-Type": "application/json",
        Codigo: prc,
      },
    };
  }
  let execution;
  if (method === "POST")
    execution = axios.post(
      `${import.meta.env.VITE_URL_DOTCORE}${url}`,
      data,
      header
    );
  else if (method === "PUT")
    execution = axios.put(
      `${import.meta.env.VITE_URL_DOTCORE}${url}`,
      data,
      header
    );
  // else if(method === 'DELETE') execution = axios.delete(`${import.meta.env.VITE_URL_DOTCORE}${url}`,data,header);
  else execution = axios.get(`${import.meta.env.VITE_URL_DOTCORE}${url}`);
  try {
    const response = await execution;
    return response;
  } catch (error: any) {
    dev_log(() => console.log(error));
    if (error.code == "ERR_NETWORK") {
      throw error;
    } else if (error.response.status == 401 && !dontNeedLogout) {
      localStorage.clear();
      window.location.reload();
    }
    throw error;
  }
};
