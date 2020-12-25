import express from "express";
import cors, { CorsOptions } from "cors";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

if (!fs.existsSync(`${__dirname}/dist`)){
    fs.mkdirSync(`${__dirname}/dist`);
};

const app = express();
app.use(cors() as any);

app.get("/video/download", async (req, res) => {
    const { id, format }: any = req.query;

    const stream = ytdl(id as string);

    const formats = {
        mp3() {
            ffmpeg(stream)
                .audioBitrate(128)
                .save(`${__dirname}/dist/${id}.mp3`)
                .on("end", () => {
                    const video = fs.createReadStream(`${__dirname}/dist/${id}.mp3`);

                    res.header("Content-Disposition", `attachment; filename=${id}.mp3`)
                    return video.pipe(res);
                });
        },
        mp4() {
            res.header("Content-Disposition", `attachment; filename=${id}.mp4`)

            return stream.pipe(res);
        },
    };

    if(formats[format]) formats[format]();
});

app.listen(process.env.PORT || 4000); // Port