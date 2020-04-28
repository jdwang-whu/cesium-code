import shapefile
import math
import json
from argparse import Namespace
from json import dumps
import codecs

# 读取shapefile文件
def shp2geo(file):
  reader = shapefile.Reader(file)
  fields = reader.fields[1:]
  field_names = [field[0] for field in fields]
  buffer = []
  for sr in reader.shapeRecords():
    record = sr.record
    record = [r.decode('gb2312', 'ignore') if isinstance(r, bytes)
         else r for r in record]
    atr = dict(zip(field_names, record))
    geom = sr.shape.__geo_interface__
    buffer.append(dict(type="Feature", geometry=geom, properties=atr))
  # 输出 GeoJSON 文件
  # geojson = codecs.open(file.split('.')[0] + "-geo.json", "w", encoding="gb2312")
  # geojson.write(dumps({"type": "FeatureCollection", "features": buffer}, indent=2) + "\n")
  # geojson.close()
  return dumps({"type": "FeatureCollection", "features": buffer}, indent=2)

# Geojson中X,Y坐标转B,L坐标
def MZ(e,i):
    return math.pow(e,i)

def trans(X,Y):
  # a,b取决于需转换的坐标系
    a = 6378137
    b = 6356752.3142
    f = (a - b) / a
    e = math.sqrt(2 * f - MZ(f, 2)) 
    e1 = e / math.sqrt(1 - MZ(e, 2))
    L0 = 120
    W0 = 0
    k0 = 1
    FE = 500000
    FN = 0
    result=[0,0]
    El1 = (1 - math.sqrt(1 - MZ(e, 2))) / (1 + math.sqrt(1 - MZ(e, 2)))
    Mf = (Y - FN) / k0
    Q = Mf / (a * (1 - MZ(e, 2) / 4 - 3 * MZ(e, 4) / 64 - 5 * MZ(e, 6) / 256))
    Bf = Q + (3 * El1 / 2 - 27 * MZ(El1, 3) / 32) * math.sin(2 * Q) + (21 * MZ(El1, 2) / 16 - 55 * MZ(El1, 4) / 32) * math.sin(4 * Q) + (151 * MZ(El1, 3) / 96) * math.sin(6 * Q) + 1097 / 512 * MZ(El1, 4) * math.sin(8 * Q)
    Rf = a * (1 - MZ(e, 2)) / math.sqrt(MZ((1 - MZ((e * math.sin(Bf)), 2)), 3))
    Nf = a / math.sqrt(1 - MZ((e * math.sin(Bf)), 2))
    Tf = MZ((math.tan(Bf)), 2)
    D = (X - FE) / (k0 * Nf)
    Cf = MZ(e1, 2) * MZ((math.cos(Bf)), 2)
    B = Bf - Nf * math.tan(Bf) / Rf * (MZ(D, 2) / 2 - (5 + 3 * Tf + 10 * Cf - 9 * Tf * Cf - 4 * MZ(Cf, 2) - 9 * MZ(e1, 2)) * MZ(D, 4) / 24 + (61 + 90 * Tf + 45 * MZ(Tf, 2) - 256 * MZ(e1, 2) - 3 * MZ(Cf, 2)) * MZ(D, 6) / 720)
    L = L0 * math.pi / 180 + 1 / math.cos(Bf) * (D - (1 + 2 * Tf + Cf) * MZ(D, 3) / 6 + (5 - 2 * Cf + 28 * Tf - 3 * MZ(Cf, 2) + 8 * MZ(e1, 2) + 24 * MZ(Tf, 2)) * MZ(D, 5) / 120)
    Bangle = B * 180 / math.pi
    Langle = L * 180 / math.pi
    result[0]=Langle
    result[1]=Bangle
    return result

def XY_TO_BL(args):
    for i in range(len(args["features"])):
      for k in range(len(args["features"][i]["geometry"]["coordinates"])):
        points = args["features"][i]["geometry"]["coordinates"][k]
        for j in range(len(points)):
          trans_result = trans(points[j][0],points[j][1])
          points[j][0] = trans_result[0]
          points[j][1] = trans_result[1]
    return args

XYGeojson = shp2geo(file='data\\11_area.shp')
args=json.loads(XYGeojson)
final_result=json.dumps(XY_TO_BL(args))

# geojson = codecs.open("geo2.json", "w", encoding="gb2312")
# geojson.write(final_result + "\n")
# geojson.close()