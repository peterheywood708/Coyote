import {
  Text,
  Space,
  Alert,
  Loader,
  Accordion,
  Container,
  Badge,
  Button,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  FaCircleInfo,
  FaMusic,
  FaRegCalendar,
  FaRegTrashCan,
} from "react-icons/fa6";
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
    <Container>
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
          <Accordion style={{ width: "600px" }} variant="separated">
            {transcripts?.map &&
              transcripts?.map((i: any) => {
                return (
                  <Accordion.Item key={i?._id} value={i?._id}>
                    <Accordion.Control>
                      <h4>
                        <FaMusic />
                        &nbsp;&nbsp;&nbsp;
                        {i?.fileName.replace(".mp3", "").replace(".wav", "")}
                      </h4>
                    </Accordion.Control>
                    <Accordion.Panel ta="left">
                      <FaRegCalendar /> &nbsp;Uploaded on{" "}
                      {new Date(i?.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Accordion.Panel>
                    <Accordion.Panel ta="left">
                      {i?.status == 0 ? (
                        <Badge color="yellow">Pending</Badge>
                      ) : null}
                      {i?.status == 1 ? (
                        <Badge color="blue">In progress</Badge>
                      ) : null}
                      {i?.status == 2 ? (
                        <Badge color="green">Completed</Badge>
                      ) : null}
                    </Accordion.Panel>
                    <Accordion.Panel ta="left">
                      {i?.status == 2 ? (
                        <>
                          <Button
                            variant="filled"
                            onClick={() => alert(i?._id)}
                          >
                            View transcription
                          </Button>
                          &nbsp;&nbsp;
                        </>
                      ) : null}
                      <Button variant="filled" color="red">
                        <FaRegTrashCan />
                        &nbsp;&nbsp; Delete
                      </Button>
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
