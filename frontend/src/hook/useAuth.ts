import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AuthData } from "../types/api";
axios.defaults.withCredentials = true;

function getMe() {
  return axios.get<AuthData>("/api/me");
}

function useAuth() {
  // Queries
  const { data, error, refetch } = useQuery({
    queryKey: ["auth"],
    queryFn: getMe,
    select: (dataInput) => {
      return dataInput.data;
    },
  });
  return { user: data?.user, sessions: data?.sessions, error, refetch };
}

export default useAuth;
