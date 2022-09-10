import mongoose from "mongoose";

const Schema = mongoose.Schema;
const clientSchema = new Schema({
  managers: {
    type: Array,
    // managers item 저장 정보
    // name: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // phone: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // created: {
    //   type: Date,
    //   default: new Date(),
    // },
    // isCalled: {
    //   type: Boolean,
    //   default: false,
    // },
    // isEntered: {
    //   type: Boolean,
    //   default: false,
    // },
    // isCanceled: {
    //   type: Boolean,
    //   default: false,
    // },
  },
});

const Client = mongoose.model("client", clientSchema);
export default Client;
