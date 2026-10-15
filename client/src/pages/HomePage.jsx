import { useContext, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../context/ChatContext";

const HomePage = () => {
  const { selectedUser, getUsers } = useContext(ChatContext);

  useEffect(() => {
    getUsers(); // 🔥 THIS WAS MISSING
  }, []);

  return (
    <div className="box-border h-dvh w-full border sm:px-[4%] sm:py-[3%] lg:px-[10%] lg:py-[4%]">
      <div
        className={`relative grid h-full min-h-0 overflow-hidden border-2 border-gray-600 bg-black/10 backdrop-blur-xl sm:rounded-2xl ${
          selectedUser
            ? "grid-cols-1 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.5fr)] xl:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.5fr)_minmax(220px,0.8fr)]"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {/* LEFT SIDEBAR */}
        <div className={selectedUser ? "max-md:hidden" : ""}>
          <Sidebar />
        </div>

        {/* CHAT AREA */}
        <ChatContainer />

        {/* RIGHT SIDEBAR */}
        {selectedUser && <div className="hidden min-h-0 xl:block"><RightSidebar selectedUser={selectedUser} /></div>}
      </div>
    </div>
  );
};

export default HomePage;
