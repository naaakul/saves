import React from "react";
import { getServerSession } from "@/utils/getServerSession";

const Page = async () => {
  const session = await getServerSession();

  if (!session?.user) {
    return <div>Not logged in</div>;
  }

  return <div>{session.user.email}</div>;
};

export default Page;
