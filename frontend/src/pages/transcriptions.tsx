import {
  Text,
  Space,
  Alert,
  Loader,
  Accordion,
  Container,
  Button,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { FaCircleInfo, FaArrowsRotate } from "react-icons/fa6";
import { useAuth } from "react-oidc-context";
import AccordionComponent from "../components/accordioncomponent";
const config = await fetch("/config/config.json").then((res) => res.json());

type ITranscript = {
  fileName: string;
  _id: string;
  date: Date;
  status: number;
  token: string;
  percentageComplete: number;
};

const Transcriptions = () => {
  const [transcripts, setTranscripts] = useState<ITranscript[]>();
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const auth = useAuth();

  const getDocuments = async () => {
    setLoading(true);
    try {
      const documents = await fetch(`${config.VITE_DB_ENDPOINT}/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth.user?.access_token || "",
        },
      });
      const transcriptions = await documents.json();
      setTranscripts(transcriptions);
      setLoading(false);
    } catch (err) {
      setFetchError(true);
      console.warn(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!transcripts && auth.user?.access_token) {
      getDocuments();
    }
  }, [transcripts, setTranscripts]);

  return (
    <Container>
      <Title order={2} fw={400}>
        Transcriptions
      </Title>
      <Space h="md"></Space>
      {loading ? (
        <Loader color="coyote" />
      ) : (
        <>
          {" "}
          <Text ta="left">
            <Button onClick={() => getDocuments()} variant="default">
              <FaArrowsRotate />
            </Button>
            <br />
            {(transcripts?.length ?? 0 > 0) ? (
              <></>
            ) : (
              <>
                <br />
                There are currently no transcriptions.{" "}
                <a href="/">Click here to start transcribing a file</a>
              </>
            )}
          </Text>
          <Space h="md"></Space>
          <Accordion style={{ width: "600px" }} variant="separated">
            {transcripts?.map &&
              transcripts?.map((i: ITranscript) => {
                return (
                  <AccordionComponent
                    fileName={i.fileName}
                    id={i._id}
                    date={i.date}
                    status={i.status}
                    token={auth.user?.access_token || ""}
                    key={i._id}
                    percentageComplete={i.percentageComplete}
                  />
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
