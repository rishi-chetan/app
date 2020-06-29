const express = require("express");
const bp = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");
const app = express();

app.set("view engine", "ejs");

app.use(bp.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rishi:root@cluster0-ilwhs.mongodb.net/todolist", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "welcome to your to-do list."
});

const item2 = new Item({
    name: "hit + to add new item."
});

const item3 = new Item({
    name: "<<< hit this to checklist an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", (req, res) => {

    Item.find({}, function(err, founditems) {

        if (founditems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                }
            });
            res.redirect("/");
        } else {
            res.render("lists", { listTitle: "Today", newitems: founditems });
        }


    });
    // let day = date.getdate();


});
app.post("/", (req, res) => {
    const itemname = req.body.newitem;
    const listName = req.body.button;

    const item = new Item({
        name: itemname
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })

    }
})

app.post("/delete", (req, res) => {
    const checkedid = req.body.checkbox;
    const listName = req.body.listname;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedid, function(err) {
            if (!err) {
                res.redirect("/");
            }
        });

    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedid } } }, function(err, foundlist) {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }


});

app.get("/:custom", function(req, res) {
    const customlistname = req.params.custom;

    List.findOne({ name: customlistname }, function(err, found) {
        if (!err) {
            if (!found) {
                const list = new List({
                    name: customlistname,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customlistname);
            } else {
                res.render("lists", { listTitle: found.name, newitems: found.items });
            }
        }
    });


});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, () => {
    console.log("server runnning");
});