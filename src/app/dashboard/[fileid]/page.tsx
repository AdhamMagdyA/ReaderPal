import React from "react";

interface PageProps {
  params: {
    fileid: string;
  };
}

const page = ({ params }: PageProps) => {
  return <div>fileid: {params.fileid}</div>;
};

export default page;
