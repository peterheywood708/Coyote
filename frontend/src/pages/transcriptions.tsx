import {
  Text,
  Space,
  Alert,
  Loader,
  Accordion,
  Container,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import { useAuth } from "react-oidc-context";

const Transcriptions = () => {
  const [transcripts, setTranscripts] = useState<object[] | null>();
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const auth = useAuth();

  useEffect(() => {
    const getDocuments = async () => {
      setLoading(true);
      try {
        const documents = await fetch(
          `${import.meta.env.VITE_DB_ENDPOINT}/list`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: auth.user?.access_token || "",
            },
          }
        );
        const transcriptions = await documents.json();
        setTranscripts(transcriptions);
        setLoading(false);
      } catch (err) {
        setFetchError(true);
        console.warn(err);
        setLoading(false);
      }
    };
    if (!transcripts && auth.user?.access_token) {
      getDocuments();
    }
  }, [transcripts, setTranscripts]);

  return (
    <Container fluid>
      <Text size="xl">Transcriptions</Text>
      <Space h="md"></Space>
      {loading ? (
        <Loader />
      ) : (
        <>
          {" "}
          <Text ta="left">
            A list of your existing transcriptions can be found below.
          </Text>
          <Space h="md"></Space>
          <Accordion>
            {transcripts?.map &&
              transcripts?.map((i: any) => {
                return (
                  <Accordion.Item key={i?._id} value={i?._id}>
                    <Accordion.Control>{i?.fileName}</Accordion.Control>
                    <Accordion.Panel ta="left">
                      Status: {i?.status}
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
          </Accordion>
          {fetchError ? (
            <Alert
              variant="light"
              color="red"
              title="Unable to retrieve transcriptions"
              icon={<FaCircleInfo />}
            >
              There was an error in trying to retrieve your transcriptions. This
              may be because the of a networking issue.
            </Alert>
          ) : null}
        </>
      )}
    </Container>
  );
};

export default Transcriptions;
