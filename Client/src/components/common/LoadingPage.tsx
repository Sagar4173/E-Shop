import React from "react";
import Layout from "../layout/Layout";
import Loading from "./Loading";

interface LoadingPageProps {
  text?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({
  text = "Loading content, please wait...",
}) => {
  return (
    <Layout>
      <div className="flex items-center justify-center h-[60vh]">
        <Loading size="large" text={text} />
      </div>
    </Layout>
  );
};

export default LoadingPage;
