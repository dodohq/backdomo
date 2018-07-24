package main

import (
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/jung-kurt/gofpdf"
)

func main() {
	dirName := os.Args[1]
	files, err := ioutil.ReadDir(dirName)
	if err != nil {
		panic(err)
	}
	pdf := gofpdf.New("P", "mm", "A4", "")
	count := 0
	for _, f := range files {
		if !f.IsDir() && filepath.Ext(f.Name()) == ".png" {
			if count%14 == 0 {
				count = count % 14
				pdf.AddPage()
			}

			x := float64(15 + (count%2)*100)
			y := float64(15 + (count/2)*40)
			pdf.Image(filepath.Join(dirName, f.Name()), x, y, 80, 20, false, "", 0, "")
			count++
		}
	}
	pdf.OutputFileAndClose(os.Args[2])
}
