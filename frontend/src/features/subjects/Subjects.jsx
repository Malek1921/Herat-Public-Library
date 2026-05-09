import React, { useState } from "react";
import AddSubject from "./components/AddSubject";
import EditSubject from "./components/EditSubject";
import SubjectsList from "./components/SubjectsList";

function Authors() {
  const [activeTab, setActiveTab] = useState("list");

  const tabs = [
    { id: "list", label: "List" },
    { id: "add", label: "Add" },
    { id: "edit", label: "Edit" },
  ];

  return (
    <div className="  bg-gray-100">
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-300 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium rounded-t-md transition ${
              activeTab === tab.id
                ? "bg-white border-t border-l border-r border-gray-300 text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-white border border-gray-300 rounded-b-md shadow-sm">
        {activeTab === "add" && <AddSubject />}
        {activeTab === "edit" && <EditSubject />}
        {activeTab === "list" && <SubjectsList />}
      </div>
    </div>
  );
}

export default Authors;
