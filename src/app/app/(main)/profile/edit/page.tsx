import { Metadata } from "next";
import { EditProfileClient } from "./edit-profile-client";

export const metadata: Metadata = {
  title: "Edit Profile | CampusLoop",
  description: "Update your campus profile, gender, academic course, bio, and interests.",
};

export default function EditProfilePage() {
  return <EditProfileClient />;
}
