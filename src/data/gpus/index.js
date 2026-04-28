// src/data/gpus/index.js
import apple            from './apple/index.js'
import nvidia_datacenter from './nvidia/datacenter.js'
import nvidia_rtx50      from './nvidia/rtx50.js'
import nvidia_rtx40      from './nvidia/rtx40.js'
import nvidia_rtx30      from './nvidia/rtx30.js'
import nvidia_rtx20      from './nvidia/rtx20.js'
import nvidia_gtx16      from './nvidia/gtx16.js'
import nvidia_gtx10      from './nvidia/gtx10.js'
import nvidia_gtx9       from './nvidia/gtx9.js'
import nvidia_pro        from './nvidia/pro.js'
import nvidia_dgx        from './nvidia/dgx.js'
import amd_datacenter    from './amd/datacenter.js'
import amd_rx9000        from './amd/rx9000.js'
import amd_rx7000        from './amd/rx7000.js'
import amd_rx6000        from './amd/rx6000.js'
import amd_rx5000        from './amd/rx5000.js'
import amd_older         from './amd/older.js'
import amd_integrated    from './amd/integrated.js'
import intel_datacenter  from './intel/datacenter.js'
import intel_arc         from './intel/arc.js'
import intel_integrated  from './intel/integrated.js'
import domestic          from './domestic/index.js'

export const GPU_LIST = [
  ...apple,
  ...nvidia_datacenter,
  ...nvidia_rtx50,
  ...nvidia_dgx,
  ...nvidia_rtx40,
  ...nvidia_rtx30,
  ...nvidia_rtx20,
  ...nvidia_gtx16,
  ...nvidia_gtx10,
  ...nvidia_gtx9,
  ...nvidia_pro,
  ...amd_datacenter,
  ...amd_rx9000,
  ...amd_rx7000,
  ...amd_rx6000,
  ...amd_rx5000,
  ...amd_older,
  ...amd_integrated,
  ...intel_datacenter,
  ...intel_arc,
  ...intel_integrated,
  ...domestic,
]
