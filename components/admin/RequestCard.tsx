import React from "react";
import { RequestCardProps } from "./RequestCards/types";
import { CityChangeCard } from "./RequestCards/CityChangeCard";
import ListingUploadCard from "./RequestCards/ListingUploadCard";
import { SignUpCard } from "./RequestCards/SignUpCard";

const RequestCard = (props: RequestCardProps) => {
    if (props.request.requestType === "CITY_CHANGE") {
        return <CityChangeCard {...props} />;
    }
    if (props.request.requestType === "LISTING_UPLOAD") {
        return <ListingUploadCard {...props} />;
    }
    return <SignUpCard {...props} />;
};

export default RequestCard;
